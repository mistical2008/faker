import type { Faker } from '.';

export enum Gender {
  female = 'female',
  male = 'male',
}

// TODO @Shinigami92 21-03-2022: Remove 0 and 1 in v7
export type GenderType = 'female' | 'male' | 0 | 1;

/**
 * Normalize gender.
 *
 * @param gender Gender.
 * @returns Normalized gender.
 */
function normalizeGender(
  gender?: GenderType
): Exclude<GenderType, number> | undefined {
  if (gender == null || typeof gender === 'string') {
    // TODO @Shinigami92 21-03-2022: Cast can be removed when we set `strict: true`
    return gender as Exclude<GenderType, number>;
  }

  const normalizedGender = gender === 0 ? 'male' : 'female';

  console.warn(
    `Deprecation Warning: Please use '${normalizedGender}' for gender instead of ${gender}`
  );

  return normalizedGender;
}

/**
 * Select a definition based on given gender.
 *
 * @param faker Faker instance.
 * @param gender Gender.
 * @param param2 Definitions.
 * @param param2.generic Non-gender definitions.
 * @param param2.female Female definitions.
 * @param param2.male Male definitions.
 * @returns Definition based on given gender.
 */
function selectDefinition(
  faker: Faker,
  gender: GenderType | undefined,
  // TODO christopher 21-03-2022: Remove fallback empty object when `strict: true`
  {
    generic,
    female,
    male,
  }: { generic?: string[]; female?: string[]; male?: string[] } = {}
) {
  const normalizedGender = normalizeGender(gender);

  let values: string[] | undefined;
  switch (normalizedGender) {
    case 'female':
      values = female;
      break;
    case 'male':
      values = male;
      break;
    default:
      values = generic;
      break;
  }

  if (values == null) {
    if (female != null && male != null) {
      values = faker.random.arrayElement([female, male]);
    } else {
      values = generic;
    }
  }

  return faker.random.arrayElement(values);
}

/**
 * Module to generate people's names and titles.
 */
export class Name {
  constructor(private readonly faker: Faker) {
    // Bind `this` so namespaced is working correctly
    for (const name of Object.getOwnPropertyNames(Name.prototype)) {
      if (name === 'constructor' || typeof this[name] !== 'function') {
        continue;
      }
      this[name] = this[name].bind(this);
    }
  }

  /**
   * Returns a random first name.
   *
   * @param gender The optional gender to use.
   * Can be either `'female'` or `'male'`.
   *
   * @example
   * faker.name.firstName() // 'Antwan'
   * faker.name.firstName("female") // 'Victoria'
   * faker.name.firstName("male") // 'Tom'
   */
  firstName(gender?: GenderType): string {
    const { first_name, female_first_name, male_first_name } =
      this.faker.definitions.name;

    return selectDefinition(this.faker, gender, {
      generic: first_name,
      female: female_first_name,
      male: male_first_name,
    });
  }

  /**
   * Returns a random last name.
   *
   * @param gender The optional gender to use.
   * Can be either `'female'` or `'male'`.
   *
   * @example
   * faker.name.lastName() // 'Hauck'
   * faker.name.lastName("female") // 'Grady'
   * faker.name.lastName("male") // 'Barton'
   */
  lastName(gender?: GenderType): string {
    const { last_name, female_last_name, male_last_name } =
      this.faker.definitions.name;

    return selectDefinition(this.faker, gender, {
      generic: last_name,
      female: female_last_name,
      male: male_last_name,
    });
  }

  /**
   * Returns a random middle name.
   *
   * @param gender The optional gender to use.
   * Can be either `'female'` or `'male'`.
   *
   * @example
   * faker.name.middleName() // 'Доброславівна'
   * faker.name.middleName("female") // 'Анастасівна'
   * faker.name.middleName("male") // 'Вікторович'
   */
  middleName(gender?: GenderType): string {
    const { middle_name, female_middle_name, male_middle_name } =
      this.faker.definitions.name;

    return selectDefinition(this.faker, gender, {
      generic: middle_name,
      female: female_middle_name,
      male: male_middle_name,
    });
  }

  /**
   * Generates a random full name.
   *
   * @param firstName The optional first name to use. If not specified a random one will be chosen.
   * @param lastName The optional last name to use. If not specified a random one will be chosen.
   * @param gender The optional gender to use.
   * Can be either `'female'` or `'male'`.
   *
   * @example
   * faker.name.findName() // 'Allen Brown'
   * faker.name.findName('Joann') // 'Joann Osinski'
   * faker.name.findName('Marcella', '', 'female') // 'Mrs. Marcella Huels'
   * faker.name.findName(undefined, 'Beer') // 'Mr. Alfonso Beer'
   * faker.name.findName(undefined, undefined, 'male') // 'Fernando Schaefer'
   */
  findName(firstName?: string, lastName?: string, gender?: GenderType): string {
    const variant = this.faker.datatype.number(8);
    let prefix = '';
    let suffix = '';

    const normalizedGender: Exclude<GenderType, number> =
      normalizeGender(gender) ??
      this.faker.random.arrayElement(['female', 'male']);

    firstName = firstName || this.faker.name.firstName(normalizedGender);
    lastName = lastName || this.faker.name.lastName(normalizedGender);

    switch (variant) {
      // TODO christopher 21-03-2022: Add possibility to have a prefix together with a suffix
      case 0:
        prefix = this.faker.name.prefix(gender);
        if (prefix) {
          return prefix + ' ' + firstName + ' ' + lastName;
        }
      // TODO @Shinigami92 2022-01-21: Not sure if this fallthrough is wanted
      // eslint-disable-next-line no-fallthrough
      case 1:
        suffix = this.faker.name.suffix();
        if (suffix) {
          return firstName + ' ' + lastName + ' ' + suffix;
        }
    }

    return firstName + ' ' + lastName;
  }

  /**
   * Return a random gender.
   *
   * @param binary Whether to return only binary gender names. Defaults to `false`.
   *
   * @example
   * faker.name.gender() // 'Trans*Man'
   * faker.name.gender(true) // 'Female'
   */
  gender(binary?: boolean): string {
    if (binary) {
      return this.faker.random.arrayElement(
        this.faker.definitions.name.binary_gender
      );
    }

    return this.faker.random.arrayElement(this.faker.definitions.name.gender);
  }

  /**
   * Returns a random name prefix.
   *
   * @param gender The optional gender to use.
   * Can be either `'female'` or `'male'`.
   *
   * @example
   * faker.name.prefix() // 'Miss'
   * faker.name.prefix('female') // 'Ms.'
   * faker.name.prefix('male') // 'Mr.'
   */
  prefix(gender?: GenderType): string {
    const { prefix, female_prefix, male_prefix } = this.faker.definitions.name;

    return selectDefinition(this.faker, gender, {
      generic: prefix,
      female: female_prefix,
      male: male_prefix,
    });
  }

  /**
   * Returns a random name suffix.
   *
   * @example
   * faker.name.suffix() // 'DDS'
   */
  suffix(): string {
    // TODO christopher 21-03-2022: Add female_suffix and male_suffix
    return this.faker.random.arrayElement(this.faker.definitions.name.suffix);
  }

  /**
   * Generates a random title.
   *
   * @example
   * faker.name.title() // 'International Integration Manager'
   */
  title(): string {
    const descriptor = this.faker.random.arrayElement(
      this.faker.definitions.name.title.descriptor
    );
    const level = this.faker.random.arrayElement(
      this.faker.definitions.name.title.level
    );
    const job = this.faker.random.arrayElement(
      this.faker.definitions.name.title.job
    );

    return descriptor + ' ' + level + ' ' + job;
  }

  /**
   * Generates a random job title.
   *
   * @example
   * faker.name.jobTitle() // 'Global Accounts Engineer'
   */
  jobTitle(): string {
    return (
      this.faker.name.jobDescriptor() +
      ' ' +
      this.faker.name.jobArea() +
      ' ' +
      this.faker.name.jobType()
    );
  }

  /**
   * Generates a random job descriptor.
   *
   * @example
   * faker.name.jobDescriptor() // 'Customer'
   */
  jobDescriptor(): string {
    return this.faker.random.arrayElement(
      this.faker.definitions.name.title.descriptor
    );
  }

  /**
   * Generates a random job area.
   *
   * @example
   * faker.name.jobArea() // 'Brand'
   */
  jobArea(): string {
    return this.faker.random.arrayElement(
      this.faker.definitions.name.title.level
    );
  }

  /**
   * Generates a random job type.
   *
   * @example
   * faker.name.jobType() // 'Assistant'
   */
  jobType(): string {
    return this.faker.random.arrayElement(
      this.faker.definitions.name.title.job
    );
  }
}
