import type { Action } from './actions'
import type { Entity } from './entities'

export type Privilege = `${Entity}:${Action}`
