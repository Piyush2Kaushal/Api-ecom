<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Stores uploads in public/uploads (works on cPanel without symlinks)
 * and converts raster images to optimised WebP.
 */
class MediaService
{
    public static function store(UploadedFile $file, string $folder, int $maxWidth = 1800): string
    {
        $dir = 'uploads/'.trim($folder, '/').'/'.date('Y/m');
        File::ensureDirectoryExists(public_path($dir));
        $base = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'file';
        $base = Str::limit($base, 60, '').'-'.Str::lower(Str::random(6));
        $mime = $file->getMimeType();

        if (in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true) && function_exists('imagewebp')) {
            $path = static::toWebp($file->getRealPath(), $mime, public_path($dir.'/'.$base.'.webp'), $maxWidth);
            if ($path) {
                return $dir.'/'.$base.'.webp';
            }
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');
        $file->move(public_path($dir), $base.'.'.$ext);

        return $dir.'/'.$base.'.'.$ext;
    }

    public static function storeFromUrl(string $url, string $folder): ?string
    {
        try {
            $res = Http::timeout(15)->get($url);
            if (! $res->successful()) {
                return null;
            }
            $tmp = tempnam(sys_get_temp_dir(), 'img');
            file_put_contents($tmp, $res->body());
            $name = basename(parse_url($url, PHP_URL_PATH) ?: 'image.jpg');
            $upload = new UploadedFile($tmp, $name, null, null, true);

            return static::store($upload, $folder);
        } catch (\Throwable) {
            return null;
        }
    }

    protected static function toWebp(string $src, string $mime, string $dest, int $maxWidth): ?string
    {
        try {
            $img = match ($mime) {
                'image/jpeg' => @imagecreatefromjpeg($src),
                'image/png' => @imagecreatefrompng($src),
                'image/webp' => @imagecreatefromwebp($src),
            };
            if (! $img) {
                return null;
            }
            $w = imagesx($img);
            $h = imagesy($img);
            if ($w > $maxWidth) {
                $nh = (int) round($h * $maxWidth / $w);
                $resized = imagecreatetruecolor($maxWidth, $nh);
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                imagecopyresampled($resized, $img, 0, 0, 0, 0, $maxWidth, $nh, $w, $h);
                imagedestroy($img);
                $img = $resized;
            } else {
                imagepalettetotruecolor($img);
                imagealphablending($img, true);
                imagesavealpha($img, true);
            }
            imagewebp($img, $dest, 84);
            imagedestroy($img);

            return $dest;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function delete(?string $path): void
    {
        if ($path && str_starts_with($path, 'uploads/') && File::exists(public_path($path))) {
            File::delete(public_path($path));
        }
    }
}
