import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'isEnumArray', async: false })
export class IsEnumArrayValidator implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        if (!Array.isArray(value)) {
            return false;
        }

        const enumValues = args.constraints[0];
        return value.every((item: any) => enumValues.includes(item));
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be an array of enum values`;
    }
}

export function IsEnumArray(enumValues: any, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEnumArray',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [enumValues],
            validator: IsEnumArrayValidator,
        });
    };
}