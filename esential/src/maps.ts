import { Callable, Dict, IndirectInfo } from './types';

export const callableIdMap = new Map<Callable, string>();
export const callableInfoMap = new Map<Callable, Dict<any>>();

