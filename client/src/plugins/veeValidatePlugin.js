// veeValidatePlugin.js
import { createApp } from 'vue';
import { Field, Form, ErrorMessage, defineRule, configure } from 'vee-validate';
import { required, email } from '@vee-validate/rules';
import validationLimits from './validation-limits.json';

const app = createApp();

// Globale Validierungsregeln
defineRule('required', required);
defineRule('email', email);

// Globale Konfiguration (optional)
configure({
  generateMessage: (ctx) => {
    return ctx.message;
  },
});

// Regel für "maxValue" definieren, wobei "field" das Feld und "limit" das Limit aus der JSON-Datei ist
defineRule('maxValue', (value, { field }) => {
  const limit = validationLimits.masterdata[field]?.maxValue;
  if (limit !== undefined && value > limit) {
    return `The ${field} field must be less than or equal to ${limit}.`;
  }
  return true;
});

// Regel für "minValue" definieren, ähnlich wie oben
defineRule('minValue', (value, { field }) => {
  const limit = validationLimits.masterdata[field]?.minValue;
  if (limit !== undefined && value < limit) {
    return `The ${field} field must be greater than or equal to ${limit}.`;
  }
  return true;
});

// Regel für "maxLength" definieren, ähnlich wie oben
defineRule('maxLength', (value, { field }) => {
  const limit = validationLimits.masterdata[field]?.maxLength;
  if (limit !== undefined && value.length > limit) {
    return `The ${field} field must not exceed ${limit} characters.`;
  }
  return true;
});

// Verwende VeeValidate-Komponenten global
app.component('VeeField', Field); // Ändere 'VeeField' entsprechend deinen Namen
app.component('VeeForm', Form);   // Ändere 'VeeForm' entsprechend deinen Namen
app.component('VeeErrorMessage', ErrorMessage); // Ändere 'VeeErrorMessage' entsprechend deinen Namen

export default app;
