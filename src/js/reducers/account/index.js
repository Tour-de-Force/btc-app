import { combineReducers } from 'redux';

import login from './login';
import registration from './registration';
import forgotPassword from './forgotPassword';
import resetPassword from './resetPassword';

export { login, logout, clearLoginValidationAndError } from './login';
export { register, clearRegistrationValidationAndError } from './registration';
export { forgotPassword, clearForgotValidationAndError } from './forgotPassword';
export { resetPassword, clearResetValidationAndError } from './resetPassword';

export default combineReducers( { login, registration, forgotPassword, resetPassword } );
