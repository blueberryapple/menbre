// sets up dependencies
import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';

// constructs i18n and l10n data structure
const languageStrings = {
    en: {
        translation: {
            SKILL_NAME: 'Menbre',
            HELP_MESSAGE: 'Repeat after me: "alexa, oh no"',
            HELP_REPROMPT: 'What can I help you with?',
            FALLBACK_MESSAGE: 'Are you having a menbre?',
            FALLBACK_REPROMPT: 'Are you having a menbre?',
            ERROR_MESSAGE: 'Sorry, an error occurred.',
            STOP_MESSAGE: 'Goodbye!'
        }
    }
};

// core functionality for fact skill
const menbreHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        // checks request type
        return (
            request.type === 'LaunchRequest' ||
            (request.type === 'IntentRequest' &&
                request.intent.name === 'menbre')
        );
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechText = "Oh no, oh no no no; I'm having a menbre!";

        return (
            handlerInput.responseBuilder
                .speak(speechText)
                // Uncomment the next line if you want to keep the session open so you can
                // ask for another fact without first re-opening the skill
                // .reprompt(requestAttributes.t('HELP_REPROMPT'))
                .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
                .getResponse()
        );
    }
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.HelpIntent'
        );
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('HELP_MESSAGE'))
            .reprompt(requestAttributes.t('HELP_REPROMPT'))
            .getResponse();
    }
};

const FallbackHandler = {
    // The FallbackIntent can only be sent in those locales which support it,
    // so this handler will always be skipped in locales where it is not supported.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.FallbackIntent'
        );
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('FALLBACK_MESSAGE'))
            .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
            .getResponse();
    }
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' ||
                request.intent.name === 'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('STOP_MESSAGE'))
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(
            `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
        );
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('ERROR_MESSAGE'))
            .reprompt(requestAttributes.t('ERROR_MESSAGE'))
            .getResponse();
    }
};

const LocalizationInterceptor = {
    process(handlerInput) {
        // Gets the locale from the request and initializes i18next.
        const localizationClient = i18n.init({
            lng: handlerInput.requestEnvelope.request.locale,
            resources: languageStrings,
            returnObjects: true
        });
        // Creates a localize function to support arguments.
        localizationClient.localize = function localize() {
            // gets arguments through and passes them to
            // i18next using sprintf to replace string placeholders
            // with arguments.
            const args = arguments;
            const value = i18n.t(...args);
            // If an array is used then a random value is selected
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            }
            return value;
        };
        // this gets the request attributes and save the localize function inside
        // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function translate(...args) {
            return localizationClient.localize(...args);
        };
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();

const skill = skillBuilder
    .addRequestHandlers(
        menbreHandler,
        HelpHandler,
        ExitHandler,
        FallbackHandler,
        SessionEndedRequestHandler
    )
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler);

export const handler = skill.lambda();
export const testableSkill = skill.create();
