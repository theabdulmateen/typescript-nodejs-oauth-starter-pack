import { Prisma } from '@prisma/client'

export const createUser = (email: string, username: string, hashedPassword: string) => {
	return Prisma.validator<Prisma.UserCreateInput>()({
		email,
		username,
		hashedPassword,
	})
}

export const findUserFromEmail = (email: string) => {
	return Prisma.validator<Prisma.UserWhereInput>()({
		email,
	})
}

export const findUserFromUsername = (username: string) => {
	return Prisma.validator<Prisma.UserWhereInput>()({
		username,
	})
}
