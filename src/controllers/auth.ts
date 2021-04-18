import { NextFunction, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import { PrismaClient, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import * as argon2 from 'argon2'

import * as authValidator from '../utils/validators/auth'
import * as authUtils from '../utils/auth-helpers'

const prisma = new PrismaClient()

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await check('password')
			.isLength({ min: 5 })
			.withMessage('must be at least 5 chars long')
			.matches(/\d/)
			.withMessage('must contain a number')
			.run(req)

		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			console.log('errors: ', errors.array())
			return res.boom.badData('Error in validating input data', errors.array())
		}

		let user: User | null = null

		if (check(req.body.emailOrUsername).isEmail()) {
			await check('emailOrUsername').normalizeEmail({ gmail_remove_dots: false }).run(req)

			user = await prisma.user.findUnique({
				where: authValidator.findUserFromEmail(req.body.emailOrUsername),
			})
		} else {
			user = await prisma.user.findUnique({
				where: authValidator.findUserFromUsername(req.body.emailOrUsername),
			})
		}

		if (!user) {
			console.error('user not found')
			return res.boom.notFound('Cannot find user with the provided credentials')
		}

		if (!user.hashedPassword) {
			return res.boom.internal('Bad auth')
		}
		const isValidPassword = await argon2.verify(user.hashedPassword, req.body.password)
		if (!isValidPassword) {
			return res.boom.badData('Incorrect password')
		}

		const tokenJWT = authUtils.generateJWTToken(user)
		return res.json({ success: true, token: tokenJWT.token, expiresIn: tokenJWT.expiresIn })
	} catch (err) {
		return res.boom.boomify(err)
	}
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await check('email', 'Email is not valid')
			.isEmail()
			.normalizeEmail({ gmail_remove_dots: false })
			.run(req)
		await check('username', 'Username is not valid').isLength({ min: 3, max: 16 }).run(req)
		await check('password')
			.isLength({ min: 5 })
			.withMessage('must be at least 5 chars long')
			.matches(/\d/)
			.withMessage('must contain a number')
			.run(req)
		await check('confirmPassword', 'Passwords do not match').equals(req.body.password).run(req)

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log('errors: ', errors.array())
			return res.boom.badData('Error in validating input data', errors.array())
		}

		const hashedPassword = await argon2.hash(req.body.password)
		const user = await prisma.user.create({
			data: authValidator.createUser(req.body.email, req.body.username, hashedPassword),
		})

		const tokenJWT = authUtils.generateJWTToken(user)
		return res.json({ success: true, token: tokenJWT.token, expiresIn: tokenJWT.expiresIn })
	} catch (err) {
		console.error(err)
		if (err instanceof PrismaClientKnownRequestError) {
			if (err.code === 'P2002') {
				console.log('User already exists with the provided credentials')
				return res.boom.conflict('User already exists with the provided credentials')
			}
		}
		return res.boom.boomify(err)
	}
}
