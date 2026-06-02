import 'package:flutter/material.dart';

class DialogueCharacterColor {
  const DialogueCharacterColor({
    required this.background,
    required this.foreground,
    required this.border,
    required this.avatarBackground,
    required this.avatarForeground,
  });

  final Color background;
  final Color foreground;
  final Color border;
  final Color avatarBackground;
  final Color avatarForeground;
}

const List<DialogueCharacterColor> _palette = [
  DialogueCharacterColor(
    background: Color(0x1A3B82F6),
    foreground: Color(0xFF1D4ED8),
    border: Color(0x4D3B82F6),
    avatarBackground: Color(0xFF3B82F6),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1A10B981),
    foreground: Color(0xFF047857),
    border: Color(0x4D10B981),
    avatarBackground: Color(0xFF10B981),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1AF59E0B),
    foreground: Color(0xFFB45309),
    border: Color(0x4DF59E0B),
    avatarBackground: Color(0xFFF59E0B),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1A8B5CF6),
    foreground: Color(0xFF6D28D9),
    border: Color(0x4D8B5CF6),
    avatarBackground: Color(0xFF8B5CF6),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1AEC4899),
    foreground: Color(0xFFBE185D),
    border: Color(0x4DEC4899),
    avatarBackground: Color(0xFFEC4899),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1A06B6D4),
    foreground: Color(0xFF0E7490),
    border: Color(0x4D06B6D4),
    avatarBackground: Color(0xFF06B6D4),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1AF97316),
    foreground: Color(0xFFC2410C),
    border: Color(0x4DF97316),
    avatarBackground: Color(0xFFF97316),
    avatarForeground: Colors.white,
  ),
  DialogueCharacterColor(
    background: Color(0x1A84CC16),
    foreground: Color(0xFF4D7C0F),
    border: Color(0x4D84CC16),
    avatarBackground: Color(0xFF84CC16),
    avatarForeground: Colors.white,
  ),
];

int _hashSeed(String seed) {
  var h = 5381;
  for (final code in seed.codeUnits) {
    h = ((h << 5) + h + code) & 0xFFFFFFFF;
  }
  return h;
}

DialogueCharacterColor colorForCharacter(String seed) {
  return _palette[_hashSeed(seed) % _palette.length];
}

String initialFor(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return '?';
  return trimmed.substring(0, 1).toUpperCase();
}
