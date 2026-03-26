import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const team = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
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
    screenshots: z.array(z.string()).optional(),
    techstack: z.array(z.string()),
    links: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    ),
  }),
});

export const collections = { team, projects };
