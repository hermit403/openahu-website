import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const team = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    published: z.boolean().default(true),
    name: z.string(),
    desc: z.string(),
    avatar: z.string(),
    website: z.string().optional(),
    github: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    desc: z.string(),
    downloadUrl: z.string().optional(),
    screenshots: z
      .array(
        z.union([
          z.string(),
          z.object({
            src: z.string(),
            alt: z.string().optional(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
        ]),
      )
      .optional(),
    techstack: z.array(
      z.union([
        z.string(),
        z.object({
          name: z.string(),
          icon: z.string(),
        }),
      ]),
    ),
    links: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
      }),
    ),
  }),
});

export const collections = { team, projects };
