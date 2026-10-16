import { h } from 'vue';

import Embed from './Embed.vue';

export const Help = () => h(Embed, { kind: 'help' });
export const Book = () => h(Embed, { kind: 'book' });
export const Contact = () => h(Embed, { kind: 'contact' });
