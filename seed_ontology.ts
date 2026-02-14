import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { printOps, publishOps } from "./src/functions";
import { TYPES, PROPERTIES } from "./src/constants";

dotenv.config();

const SPACE_ID = process.env.DEMO_SPACE_ID;
if (!SPACE_ID) throw new Error("Missing DEMO_SPACE_ID in .env");

// Minimal ontology seed (names are human-facing; IDs are the constant IDs you’ll reuse)
const TYPE_SEED = [
  { id: TYPES.course, name: "Course", description: "A structured collection of lessons." },
  { id: TYPES.lesson, name: "Lesson", description: "A unit inside a course, usually a page or video." },
  { id: TYPES.topic, name: "Topic", description: "A concept/tag used to organize courses and lessons." },
  { id: TYPES.organization, name: "Organization", description: "Publisher/provider of a course." },
] as const;

const PROPERTY_SEED = [
  // Value properties
  { id: PROPERTIES.name, name: "name", description: "Display name/title." },
  { id: PROPERTIES.description, name: "description", description: "Short summary." },
  { id: PROPERTIES.url, name: "url", description: "Primary entry URL." },
  { id: PROPERTIES.lesson_order, name: "lesson_order", description: "Ordering number within a course." },

  // Relation properties
  { id: PROPERTIES.has_lesson, name: "has_lesson", description: "Course → Lesson membership relation." },
  { id: PROPERTIES.covers_topic, name: "covers_topic", description: "Course/Lesson → Topic tagging relation." },
  { id: PROPERTIES.published_by, name: "published_by", description: "Course → Organization publisher/provider relation." },
] as const;

async function main() {
  const ops: Op[] = [];

  // Create Type entities (as entities typed "Type")
  for (const t of TYPE_SEED) {
    const out = Graph.createEntity({
      id: t.id,                 // IMPORTANT: stable ID from constants
      name: t.name,
      description: t.description,
      types: [TYPES.type],      // meta-type from your demo constants
    });
    ops.push(...out.ops);
  }

  // Create Property entities (as entities typed "Property")
  for (const p of PROPERTY_SEED) {
    const out = Graph.createEntity({
      id: p.id,
      name: p.name,
      description: p.description,
      types: [TYPES.property],  // meta-type from your demo constants
    });
    ops.push(...out.ops);
  }

  printOps(ops);

  // publishOps likely reads PK_SW from env (as in your demo header)
  const result = await publishOps(ops, SPACE_ID);
  console.log("\nSeed ontology published:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});