import 'vanilla-cookieconsent/dist/cookieconsent.css'
import type {CookieConsentConfig} from 'vanilla-cookieconsent'
import * as CookieConsent from 'vanilla-cookieconsent'

/**
 * @see https://cookieconsent.orestbida.com/
 */
const config: CookieConsentConfig = {
  // TODO: Change when changing categories
  revision: 2,

  guiOptions: {
    consentModal: {
      layout: 'bar',
      position: 'bottom center',
      equalWeightButtons: true,
      flipButtons: false
    },
    preferencesModal: {
      layout: 'box',
      position: 'right',
      equalWeightButtons: true,
      flipButtons: true
    }
  },

  // disablePageInteraction: true,

  categories: {

    necessary: {
      readOnly: true,

      services: {
        auth: {
          label: 'Authentication',
        }
      }
    },

    analytics: {
      services: {
        matomo: {
          label: 'Matomo',
          cookies: [
            {
              name: /^(_pk_)/
            },
          ],

          onAccept: () => {
            // console.debug('Matomo accepted')

            // Reload the page to load the Matomo script
            // window.location.reload()
          },

          onReject: () => {
            // console.debug('Matomo rejected')

            // Reload the page to remove the Matomo script
            window.location.reload()
          }
        }
      }
    }
  },

  language: {
    default: 'en',
    autoDetect: 'document',
    translations: {
      en: {
        consentModal: {
          // TODO: Change when changing categories
          revisionMessage: undefined,

          title: 'I want to create the best experience for you',
          description: 'This website uses <strong>cookies</strong> to ensure I can craft the best experience. ' +
            'I only use essential cookies required for the site to function, and third-party analytics cookies to' +
            ' understand the audience better. ' +
            'You can manage cookies anytime by visiting the “Consent Preferences Center” section in ' +
            'the “Legal” page.',

          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences',

          footer: '<a href="/privacy-policy">Privacy policy</a>\n<a href="/terms-of-service">Terms and conditions</a>'
        },

        preferencesModal: {
          title: 'Consent Preferences Center',

          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',

          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close modal',

          serviceCounterLabel: 'Service|Services',

          sections: [
            {
              title: 'Cookie Usage',
              description: undefined
            },
            {
              title: 'Essential Cookies <span class="pm__badge">Always Enabled</span>',
              description: 'Necessary for the website to function and cannot be switched off in our systems as they enable core website functionality',
              linkedCategory: 'necessary'
            },
            {
              title: 'Analytics Cookies',
              description: 'Allow us to measure & improve the performance of our site',
              linkedCategory: 'analytics'
            },
            {
              title: 'More information',
              description: 'For any query in relation to the policy on cookies and your choices, please read the <a class="cc__link" href="/legal">legal page</a> and its linked pages.'
            }
          ]
        }
      }
    }
  },
}

/**
 * This is the last plugin as other plugins should set up event listeners first
 */
export default defineNuxtPlugin(async () => {
  await CookieConsent.run(config)

  return {
    provide: {
      CC: CookieConsent,
    },
  }
})
