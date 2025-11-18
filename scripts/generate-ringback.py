#!/usr/bin/env python3
"""
Generate 8-second ringback pattern audio file
Format: PCM 16-bit 8kHz WAV (telephony standard)
Pattern: 2s ring + 4s silence + 2s ring
"""

import math
import wave
import struct

# Audio parameters
SAMPLE_RATE = 8000  # 8kHz (telephony standard)
DURATION_RING = 2.0  # 2 seconds of ringing
DURATION_SILENCE = 4.0  # 4 seconds of silence
AMPLITUDE = 0.3  # 30% amplitude (comfortable volume)

# North American ringback tones (dual frequency)
FREQ1 = 440.0  # Hz
FREQ2 = 480.0  # Hz

def generate_ringback_tone(duration, sample_rate=SAMPLE_RATE):
    """Generate dual-frequency ringback tone"""
    num_samples = int(sample_rate * duration)
    audio = []

    for i in range(num_samples):
        t = i / sample_rate
        # Generate two sine waves and combine
        tone1 = math.sin(2 * math.pi * FREQ1 * t)
        tone2 = math.sin(2 * math.pi * FREQ2 * t)
        combined = (tone1 + tone2) / 2  # Average to prevent clipping

        # Apply amplitude and convert to int16
        sample = int(combined * AMPLITUDE * 32767)
        audio.append(sample)

    return audio

def generate_silence(duration, sample_rate=SAMPLE_RATE):
    """Generate silence"""
    num_samples = int(sample_rate * duration)
    return [0] * num_samples

# Generate audio segments
print("Generating 8-second ringback pattern...")
ring1 = generate_ringback_tone(DURATION_RING)
silence = generate_silence(DURATION_SILENCE)
ring2 = generate_ringback_tone(DURATION_RING)

# Combine segments
full_audio = ring1 + silence + ring2

print(f"Total samples: {len(full_audio)}")
print(f"Duration: {len(full_audio) / SAMPLE_RATE:.1f} seconds")

# Write WAV file (PCM 16-bit format)
output_path = "../public/ringback-pattern.wav"
with wave.open(output_path, 'w') as wav_file:
    wav_file.setnchannels(1)  # Mono
    wav_file.setsampwidth(2)  # 2 bytes = 16-bit
    wav_file.setframerate(SAMPLE_RATE)

    # Pack samples as signed 16-bit integers
    packed_data = struct.pack('<' + 'h' * len(full_audio), *full_audio)
    wav_file.writeframes(packed_data)

print(f"✅ Ringback pattern saved to {output_path}")
print(f"   - Format: PCM 16-bit 8kHz mono")
print(f"   - Size: {len(full_audio) * 2} bytes")
print(f"   - Duration: {len(full_audio) / SAMPLE_RATE:.1f} seconds")
print(f"   - Pattern: 2s ring + 4s silence + 2s ring")
