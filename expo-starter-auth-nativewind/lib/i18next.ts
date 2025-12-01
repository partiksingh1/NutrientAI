import { I18n } from 'i18n-js';
import en from '../locales/en/en.json'
import it from '../locales/it/it.json'

export const i18n = new I18n();

i18n.translations = {
    en,
    it
}
i18n.locale = "it"