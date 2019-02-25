import { Mock, Record, IFmModelRelationshipMeta } from "..";
import { IMockConfig } from "./types";
import { RealTimeDB } from "abstracted-firebase";
import { Parallel } from "wait-in-parallel";

export async function processHasMany<T>(
  record: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockConfig,
  db: RealTimeDB
) {
  const cardinality = config.cardinality
    ? typeof config.cardinality[rel.property] === "number"
      ? config.cardinality[rel.property]
      : NumberBetween(config.cardinality[rel.property] as any)
    : 2;
  const p = new Parallel(
    `Adding hasMany for ${rel.property} on ${
      record.modelName
    }. Cardinality of ${cardinality}.`
  );

  // for (const i of Object.keys(test)) {
  console.log(record.modelName, rel.property);
  const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();

  const prop: Extract<keyof T, string> = rel.property as any;

  p.add(
    `hasMany-${fkMockMeta.compositeKey}`,
    record.addToRelationship(prop, fkMockMeta.compositeKey)
  );

  return p.isDone();
  // }
}

function NumberBetween(startEnd: [number, number]) {
  return (
    Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]
  );
}
