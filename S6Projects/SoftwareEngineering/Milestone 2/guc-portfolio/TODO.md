# TODO - Student Explore popup layering + explore requirements

## Step 1: Fix popup to be on top of the page (z-index)
- Inspect current StudentExplore "selected details" implementation.
- Replace inline details section with a proper modal overlay (position: fixed) rendered above the page.
- Ensure overlay and modal have high z-index and do not get hidden by layout/sidebar.

## Step 2: Ensure requirements are met in Explore
- Course instructors search by name or course.
- Search project by title.
- Search portfolio by student name or email.
- Filter portfolios by major or skills.
- Filter project titles by course or instructor and/or project creation date.
- Sort project titles by creation date or rating.
- Sort portfolios based on number of projects.

## Step 3: Validate instructor search is present in StudentExplore
- If missing, add instructor data and search UI.
- Wire it to the existing filtered results.

## Step 4: Add/adjust UI + styles
- Add CSS for modal and overlay (and any missing explore controls).

## Step 5: Run tests / sanity check
- Run npm test/build (if available) or at least start the app and verify modal layering.

