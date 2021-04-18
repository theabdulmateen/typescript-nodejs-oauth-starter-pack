import express, { Request, Response } from 'express'
import boom from 'express-boom'
import cors from 'cors'
import * as dotenv from 'dotenv'

// Controllers (route handlers)
import * as authController from './controllers/auth'

// Middlewares
import * as authMiddleware from './middlewares/auth'

// API keys and Passport configuration
import passport from './config/passport'

dotenv.config()
const app = express()

// Express Configuration
app.set('port', process.env.PORT || 3000)
app.use(passport.initialize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(boom())

/**
 * Primary app routes.
 */
app.post('/login', authController.login)
app.post('/register', authController.register)
app.get(
	'/protected',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response) => {
		return res.json({ success: true, message: 'You are successfully authenticated' })
	}
)
app.get(
	'/auth/google',
	passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
)
app.get(
	'/auth/google/callback',
	passport.authenticate('google', { session: false, failureRedirect: '/login' }),
	authMiddleware.getJWTToken
)

app.get('/auth/facebook', passport.authenticate('facebook', { session: false, scope: 'email' }))
app.get(
	'/auth/facebook/callback',
	passport.authenticate('facebook', { session: false, scope: 'email' }),
	authMiddleware.getJWTToken
)

export default app
