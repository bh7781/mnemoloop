# Question Generation Workflow

Mnemoloop uses a Generate Once -> Store -> Reuse Many Times workflow for practice questions. Questions are generated from markdown content, saved as JSON question banks, committed to the repo, and reused by the app.

## Source Of Truth

Question quality and generation rules live in:

```sh
skills/question-generation/SKILL.md
```

The generator script uses this skill file during generation. Humans and AI coding assistants should read `skills/question-generation/SKILL.md` before modifying the generator or regenerating questions.

## Standard Workflow

1. Add or update markdown files under `content/`.

2. Run a dry scan:

   ```sh
   npm run generate:questions
   ```

3. Review the missing question bank paths reported by the scan.

4. Generate missing question banks with a safe limit:

   ```sh
   npm run generate:questions -- --generate --limit N
   ```

   Choose `N` based on how many files you want to generate in one pass.

5. Test locally:

   ```sh
   npm run dev
   ```

6. Verify the app views:

   - `/content`
   - `/practice`

7. Commit the generated question files.

8. Push to GitHub so Vercel deploys the updated content and question banks.

## File Layout

Generated questions should follow the same parallel path as the source markdown:

```txt
content/<path>/<chapter>.md
generated/questions/<path>/<chapter>.questions.json
```

For example, `content/foundations/attention.md` should generate to `generated/questions/foundations/attention.questions.json`.

## Safety Notes

- Keep API keys only in `.env.local`.
- Never commit API keys or other secrets.
- Generated question banks under `generated/questions/` are durable app data and should be committed after review.
