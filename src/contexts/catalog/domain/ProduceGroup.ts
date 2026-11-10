/** Input for {@link ProduceGroup.create}. */
export interface ProduceGroupInput {
  readonly slug: string;
  readonly name: string;
  readonly latinName: string;
  readonly description: string;
}

/** A botanical family that groups related produce (e.g. Brassicaceae). */
export class ProduceGroup {
  readonly slug: string;
  readonly name: string;
  readonly latinName: string;
  readonly description: string;

  private constructor(input: ProduceGroupInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.latinName = input.latinName;
    this.description = input.description;
    Object.freeze(this);
  }

  /** Creates a produce group. */
  static create(input: ProduceGroupInput): ProduceGroup {
    return new ProduceGroup(input);
  }
}
