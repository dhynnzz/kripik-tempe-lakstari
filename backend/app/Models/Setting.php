<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'settings';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Helper to get setting value by key with optional default
     */
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        if ($setting) {
            $decoded = json_decode($setting->value, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
        }
        return $default;
    }

    /**
     * Helper to set setting value by key
     */
    public static function set($key, $value)
    {
        $encoded = is_array($value) || is_object($value) ? json_encode($value) : $value;
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $encoded]
        );
    }
}
