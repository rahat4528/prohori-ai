# Prohori AI — 10-Minute Final Submission Checklist

**Team Orionids · Department of Computer Science & Engineering, Daffodil International University**  
**International AI Builders Congress 2026 · Domain: InfraSphere AI &rarr; SecureAI**  
**Target Repository**: [https://github.com/rahat4528/prohori-ai](https://github.com/rahat4528/prohori-ai)

> [!IMPORTANT]
> All software engineering, multi-port defensive sensors, deterministic triage, local Ollama integration, decoupled event ingestion, UI simplification, test suites (38/38 passed), and empirical benchmark verifications are **100% complete and verified**.
> Follow this sequential 10-minute checklist to complete the human-only items and finalize your submission.

---

## ⏱️ The 10-Minute Action Checklist

### Task 1: Fill Official Team Roster (~2 minutes)
Open [`docs/TEAM.md`](TEAM.md) and replace the `[FILL]` placeholders:
1. **Member 1 (Lead)**: Name, role (e.g. Lead System Architect), credibility line (e.g. CSE Senior, built FastAPI event bus).
2. **Member 2**: Name, role (e.g. Frontend & UI Engineer), credibility line (e.g. Built React 19 operator console).
3. **Member 3**: Name, role (e.g. AI & Cyber Defense Specialist), credibility line (e.g. Curated MITRE ATT&CK & STIX datasets).
4. **Pitch slot duration**: Enter your allocated presentation minutes (e.g. `3`, `4`, or `5` minutes). See the 4-part 90% segment budget table in [`docs/PITCH_DECK.md`](PITCH_DECK.md#a-4-part-segment-budget-target-finish-at-90-of-slot) (calibrated to measured ~7.2s demo execution).
5. **Bonus signals**: Specify female team member or diaspora advisor if applicable; otherwise leave as `"none"`.

*(Once filled, [`README.md`](../README.md) and [`docs/PITCH_DECK.md`](PITCH_DECK.md) automatically align).*

---

### Task 2: Native Bengali Speaker Sign-Off (~3 minutes)
Open [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md):
1. Have a teammate who reads native Bangla inspect the 10 rows in the **Review Matrix** and the **UI Strings Table**.
   - Note: Rows 01–05 are from the deterministic engine (grammatically sound).
   - Rows 06–10 are from the 3B Llama 3.2 model running on CPU (contain synthetic phrasing; note any corrections).
2. Check the `[ ]` boxes for **Accurate?**, **Fluent?**, and **Terminology OK?**.
3. Fill the **Reviewer Sign-Off Block** at the bottom of [`docs/BANGLA_REVIEW.md`](BANGLA_REVIEW.md):
   - Reviewer Name, Affiliation, Date, and Signature line.
4. In [`docs/FINAL_SIGNOFF.md`](FINAL_SIGNOFF.md), change `[ ] Gate 2: Bengali Linguistic Review Signed` to `[x]`.

---

### Task 3: Record the 75-Second Narrated Video (~3 minutes)
Follow the step-by-step protocol in [`docs/BACKUP_VIDEO_GUIDE.md`](BACKUP_VIDEO_GUIDE.md):
1. **Launch Stack**: Run `run_dev.bat` or `scripts/run_all.ps1`.
2. **Open Browser**: Navigate to [http://localhost:3000](http://localhost:3000) (press `F11` for clean full-screen).
3. **Record**: Press `Win + Alt + R` (Windows Game Bar) or use OBS Studio.
4. **Follow the Narration Script**:
   - `0:00 – 0:15`: Show 2-column console, live status dot, and header controls.
   - `0:15 – 0:35`: Click **"Run demo"** (`Shift+D`). Show incoming alert card in left feed.
   - `0:35 – 0:50`: Highlight right panel (What Happened narrative, MITRE citation chip `[T1110.001]`, Bengali reasoning).
   - `0:50 – 0:65`: Click green **"🛡️ প্রতিরক্ষা অনুমোদন করুন (Approve Defense)"** button. Point to instant inline audit confirmation card.
   - `0:65 – 0:75`: Press `Shift+A` to show the append-only Audit Log drawer, then `Shift+P` to reveal the pitch deck.
5. **Save Copies**:
   - Save the recording to `docs/backup/prohori_demo_backup.mp4` and copy to a backup USB drive for the competition venue.
6. In [`docs/FINAL_SIGNOFF.md`](FINAL_SIGNOFF.md), tick `[x] Gate 3: Live Teammate Pitch Dry-Run Completed`.

---

### Task 4: Decide Repository Visibility & Push to Remote (~2 minutes)

The repository currently resides on your GitHub account as a private repository (`https://github.com/rahat4528/prohori-ai`). Check the competition guidelines for submission requirements:

#### Option A: Make Repository Public (Standard for Open Hackathons)
Run the following GitHub CLI command from your PowerShell terminal:
```powershell
gh repo edit rahat4528/prohori-ai --visibility public --yes
```

#### Option B: Keep Private and Add Judges / Organizers as Collaborators
If the competition requires private repositories with invited evaluators:
```powershell
# Add evaluator or judge by their GitHub username:
gh api -X PUT /repos/rahat4528/prohori-ai/collaborators/[JUDGE_GITHUB_USERNAME] -f permission=pull
```

#### Final Push Verification
To push all certified commits from branch `ui-simplify` to `main` on GitHub:
```powershell
# Merge ui-simplify cleanly into main:
git checkout main
git merge ui-simplify --no-edit

# Push main and ui-simplify to remote:
git push origin main
git push origin ui-simplify

# Confirm remote status:
gh repo view rahat4528/prohori-ai
```

---

## 🎯 Summary of Gates in [`docs/FINAL_SIGNOFF.md`](FINAL_SIGNOFF.md)

| Gate | Status | Owner | Evidence |
|---|---|---|---|
| **Gate 1: Real LLM Inference & Decoupling** | **CERTIFIED** | Automated Agent | Tested on Ollama `llama3.2`, JSON grammar failover, benchmark in `docs/evidence/llm_runs.md`. Ingestion decoupled to 35ms. |
| **Gate 2: Bengali Linguistic Review** | **PENDING** | Native Teammate | Awaiting reviewer name & sign-off in `docs/BANGLA_REVIEW.md`. |
| **Gate 3: Live Pitch Rehearsal & Backup Video** | **PENDING** | Presenter | Awaiting 75s narrated MP4 recording via `docs/BACKUP_VIDEO_GUIDE.md`. |
| **Gate 4: Official Team Orionids Roster** | **PENDING** | Team Lead | Awaiting 3 student names and roles in `docs/TEAM.md`. |

Once Tasks 1, 2, 3, and 4 are done, all 4 gates are signed and Prohori AI is **100% READY FOR SUBMISSION**!

