import { register } from 'node:module';

register('data:text/javascript,export async function initialize(){}', import.meta.url);
console.log('done');
