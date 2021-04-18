import { Prisma } from '@prisma/client'

export const createUser = (email: string, srn: string, hashedPassword: string) => {
	return Prisma.validator<Prisma.UserCreateInput>()({
		email,
		srn,
		hashedPassword,
	})
}

export const createUserGoogleAuth = (email: string, googleId: string) => {
	return Prisma.validator<Prisma.UserCreateInput>()({
		email,
		googleId,
	})
}

// export const selectUserGoogleAuth = (email: string, googleId: string) => {
// 	return Prisma.validator<Prisma.UserSelect>()({
// 		email,
// 		googleId,
// 	})
// }

export const findUserFromEmail = (email: string) => {
	return Prisma.validator<Prisma.UserWhereInput>()({
		email,
	})
}
