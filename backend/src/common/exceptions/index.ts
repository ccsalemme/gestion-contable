export class NotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundException'
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedException'
  }
}

export class ForbiddenException extends Error {
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenException'
  }
}

export class BadRequestException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestException'
  }
}

export class InternalServerErrorException extends Error {
  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerErrorException'
  }
}
