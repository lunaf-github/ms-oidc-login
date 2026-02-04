import dotenv from 'dotenv';
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
dotenv.config();

const initPassport = async () => {
    const idmetadata = `${process.env.CLOUD_INSTANCE}/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    
    const azureADConfig = {
        identityMetadata: idmetadata,
        clientID: clientId,
        clientSecret: clientSecret, 
        responseType: process.env.RESPONSE_TYPE,
        responseMode: process.env.RESPONSE_MODE,
        redirectUrl: process.env.REDIRECT_URI, 
        allowHttpForRedirectUrl: true, // Set to true for local development
        isB2C: false, // Set to true if using Azure AD B2C
        validateIssuer: false,  // Set to true if you want to validate the issuer
        passReqToCallback: true,
        useCookieInsteadOfSession: false, // Use cookies for session management
        scope: ['openid', 'profile', 'email'], // Specify the required scopes
        loggingLevel: 'info', // Adjust logging level as needed

        // ADD THESE TWO LINES:
    skipUserProfile: true, // Speeds up the process
    loggingLevel: 'error', // Change to 'info' if you need more logs
    };

    const callbackFunction = (req, iss, sub, profile, accessToken, refreshToken, done) => {
        if ( accessToken ) {
            //console.log( 'Received accessToken - ' + accessToken );
        }
        if ( refreshToken ) {
            //console.log( 'Received refreshToken - ' + refreshToken );
        }
        if ( !profile.oid ) {
            //console.log( 'Received accessToken - ' + accessToken );
            return done( new Error( "No oid found" ), null );
        }
        // if ( profile ) {
        //     console.log( 'profile - ' + JSON.stringify( profile ) );
        // }
        
        return done(null, profile);
    };

    passport.use( new OIDCStrategy(azureADConfig, callbackFunction));
};

export { initPassport };
