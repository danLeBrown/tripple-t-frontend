import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  RectangleStackIcon,
} from '@heroicons/vue/24/outline';
import type { Component } from 'vue';

export function getFileTypeIcon(mimetype: string): Component {
  if (mimetype.startsWith('image/')) {
    return PhotoIcon;
  } else if (mimetype === 'application/pdf') {
    return DocumentTextIcon;
  } else if (
    mimetype.startsWith('video/') ||
    mimetype === 'application/vnd.apple.mpegurl'
  ) {
    return FilmIcon;
  } else if (mimetype.startsWith('audio/')) {
    return MusicalNoteIcon;
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar') ||
    mimetype.includes('archive')
  ) {
    return ArchiveBoxIcon;
  } else if (
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('xml') ||
    mimetype.includes('html') ||
    mimetype.includes('css')
  ) {
    return CodeBracketIcon;
  } else if (
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('powerpoint') ||
    mimetype.includes('office') ||
    mimetype.includes('officedocument')
  ) {
    return DocumentIcon;
  } else {
    return RectangleStackIcon;
  }
}

export function getFileTypeIconClass(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    return 'text-blue-500';
  } else if (mimetype === 'application/pdf') {
    return 'text-red-500';
  } else if (mimetype.startsWith('video/')) {
    return 'text-purple-500';
  } else if (mimetype.startsWith('audio/')) {
    return 'text-green-500';
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar')
  ) {
    return 'text-yellow-600';
  } else if (
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('xml')
  ) {
    return 'text-orange-500';
  } else if (
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('powerpoint')
  ) {
    return 'text-blue-600';
  } else {
    return 'text-gray-500';
  }
}

export function getFileTypeLabel(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype || 'Image';
  } else if (mimetype === 'application/pdf') {
    return 'PDF';
  } else if (mimetype.startsWith('video/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype ? `Video (${subtype})` : 'Video';
  } else if (mimetype.startsWith('audio/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype ? `Audio (${subtype})` : 'Audio';
  } else if (mimetype.includes('zip')) {
    return 'ZIP Archive';
  } else if (mimetype.includes('rar')) {
    return 'RAR Archive';
  } else if (mimetype.includes('tar')) {
    return 'TAR Archive';
  } else if (mimetype.includes('javascript')) {
    return 'JavaScript';
  } else if (mimetype.includes('json')) {
    return 'JSON';
  } else if (mimetype.includes('xml')) {
    return 'XML';
  } else if (mimetype.includes('html')) {
    return 'HTML';
  } else if (mimetype.includes('word') || mimetype.includes('document')) {
    return 'Word Document';
  } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
    return 'Excel Spreadsheet';
  } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
    return 'PowerPoint';
  } else {
    // Extract the main type and subtype
    const parts = mimetype.split('/');
    if (parts.length === 2) {
      const [mainType, subType] = parts;
      return `${mainType.charAt(0).toUpperCase() + mainType.slice(1)} (${subType.toUpperCase()})`;
    }
    return mimetype;
  }
}

