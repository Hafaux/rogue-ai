import { Narration, Narrator } from './narrator/narrator'

export interface Player {
    id: string;
    theme: string;
    narrator: Narrator;
}