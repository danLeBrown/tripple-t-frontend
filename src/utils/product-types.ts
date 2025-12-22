import {
  BeakerIcon,
  CubeIcon,
  RectangleStackIcon,
  SwatchIcon,
} from '@heroicons/vue/24/outline';
import type { Component } from 'vue';

import type { ProductType } from '../types';

export function getProductTypeIcon(type: ProductType): Component {
  switch (type) {
    case 'Bottle':
      return BeakerIcon;
    case 'Cap':
      return CubeIcon;
    case 'Preform':
      return SwatchIcon;
    case 'Nylon':
      return RectangleStackIcon;
    case 'Other':
    default:
      return RectangleStackIcon;
  }
}

export function getProductTypeIconClass(type: ProductType): string {
  switch (type) {
    case 'Bottle':
      return 'text-blue-500';
    case 'Cap':
      return 'text-green-500';
    case 'Preform':
      return 'text-purple-500';
    case 'Nylon':
      return 'text-orange-500';
    case 'Other':
    default:
      return 'text-gray-500';
  }
}

