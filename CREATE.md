Build a full-stack web application for screenshot-based UI/UX feedback and AI-assisted design critique.

The product is a lightweight visual review platform where users upload screenshots of websites, applications, dashboards, or mobile interfaces, then receive feedback directly on selected areas of the image. The platform must support public and private screenshots, community feedback with precise area annotation, and a private AI critique tab visible only to the screenshot owner.

The application must be implemented with React + Vite on the frontend, Node.js on the backend, Supabase for database and file storage, Render for backend deployment, Vercel for frontend deployment, and OpenRouter as the AI API provider.

Core product behavior:
Users can upload a screenshot image, give it a title and optional description, and choose visibility: Public or Private. Public screenshots appear in a global feed and can be opened by any user. Private screenshots are accessible only through a direct link and do not appear in the public feed. Every screenshot has its own detail page.

The screenshot detail page is the heart of the product. It must use a two-column layout: the screenshot viewer on the left and a fixed sidebar on the right. The screenshot should remain visually clean and uncluttered. Feedback overlays must be subtle and should never block the image. The sidebar must contain two tabs: “Community Feedback” and “AI Critique”.

Community feedback behavior:
Any user who can access the screenshot page may leave feedback on the screenshot. To add feedback, there must be a clearly visible “Add Feedback” button. When clicked, the user can drag on the screenshot to select a rectangular area, similar to a screen capture selection. After the region is selected, a small comment input appears so the user can write a message. The comment is then attached to that exact region. The feedback system must store the region coordinates and dimensions relative to the original image, so annotations remain accurate across different screen sizes and responsive layouts.

The screenshot image must display subtle visual markers for each comment. These markers should not overwhelm the screenshot. Each feedback item should be represented by either a thin outlined rectangle, a small numbered marker, or a minimal highlight overlay. When a user hovers or clicks a marker on the image, the corresponding comment card in the sidebar must be highlighted. When a user hovers or clicks a comment card in the sidebar, the matching region on the screenshot must be highlighted. The community feedback tab must show all user-generated comments, with author, timestamp, and optional short metadata. Feedback must appear in a readable list format inside the sidebar.

A “Hide All Feedback” button must be available. When enabled, it hides all markers, overlays, and highlighted regions so the screenshot can be viewed without distractions. This feature is for focus mode and should be instantaneous and reversible.

AI critique behavior:
The AI critique is a separate private feature. It must only be visible to the owner of the screenshot and must never be shown to other users. AI analysis must appear in the “AI Critique” tab only when the viewer is the screenshot owner. Non-owners should not be able to access this tab’s content.

The AI feature is called “Instant UI Critique”. After a screenshot is uploaded, the backend sends the image to OpenRouter using a vision-capable model. The AI must analyze the screenshot and return structured feedback about the UI/UX design. The AI should identify likely issues such as poor visual hierarchy, weak CTA visibility, excessive clutter, spacing inconsistencies, contrast problems, unreadable text, overloaded sections, unclear grouping, and potential accessibility concerns.

The AI result must not be just plain text. It must also include automatically identified problematic zones on the image. These zones should be rendered visually on the screenshot in the AI Critique tab using subtle overlays or highlighted regions, similar to how community feedback regions are shown. The AI tab should present a clean structured analysis including:

* a short overall summary,
* a list of detected problems,
* a severity or priority score for each problem,
* one or more highlighted areas corresponding to those problems,
* actionable recommendations for improving the design.

The AI analysis should be generated automatically after upload, stored in the database, and loaded when the owner opens the AI Critique tab. The design of AI feedback should feel analytical, helpful, and private.

Public feed behavior:
The application must include a global feed page that shows all public screenshots in a grid or list. Each screenshot preview card should show a thumbnail, title, author, and comment count or similar useful metadata. Clicking a public screenshot opens its dedicated detail page.

Private screenshot behavior:
Private screenshots must not appear in the feed. They are accessible only through direct URL. The page should still support community feedback if the link is shared, but discovery must remain private.

User experience and layout:
The UI must be modern, clean, and minimal. The screenshot itself should be the main focus of the page. Avoid clutter, oversized overlays, excessive popups, or anything that hides the screenshot. The overall look should feel polished, lightweight, and easy to understand immediately. The feedback system must feel natural, fast, and intuitive.

Authentication:
Implement a simple authentication system using Supabase Auth or an equivalent lightweight auth flow integrated with Supabase. Users should be able to log in, upload screenshots, leave feedback, and own private AI critiques. The application should clearly track screenshot ownership.

Data model requirements:
Design the database schema in Supabase to support:

* users
* screenshots
* feedback comments
* AI critique results
* optional feedback region metadata

Each screenshot record should include:

* id
* owner_id
* title
* description
* image_url
* visibility (public/private)
* created_at
* updated_at

Each feedback record should include:

* id
* screenshot_id
* user_id
* comment text
* x
* y
* width
* height
* created_at
* updated_at

Each AI critique record should include:

* id
* screenshot_id
* owner_id
* summary text
* structured issues JSON
* highlighted regions JSON
* created_at
* updated_at

The feedback coordinates must be saved in a way that supports responsive rendering. Use normalized coordinates or another robust system so the selected area remains accurate on any screen size. The screenshot viewer must map annotation coordinates correctly regardless of scaling.

Frontend requirements:
Use React + Vite. Build the application as a component-based interface with a clean structure. The frontend should include:

* public feed page
* upload page or upload modal
* screenshot detail page
* screenshot viewer component
* selection overlay component
* comment sidebar component
* community feedback tab
* AI critique tab
* hide all feedback button
* add feedback button
* authentication UI
* loading states
* empty states
* error states

The screenshot viewer must support:

* image loading
* responsive scaling
* drag-to-select rectangle creation
* rendering feedback overlays
* hover and click interactions
* focus mode toggling
* switching between community and AI tabs

Backend requirements:
Use Node.js and expose API endpoints for:

* authentication/session handling if needed
* screenshot upload metadata creation
* screenshot retrieval
* public feed retrieval
* feedback creation
* feedback retrieval
* AI critique generation
* AI critique retrieval
* permission checks for private screenshots and owner-only AI access

The backend must validate requests, enforce permissions, and ensure that private AI results are only returned to the owner. The backend should use Supabase for persistence and storage. It should also handle image upload metadata and call OpenRouter for AI critique generation.

OpenRouter integration:
The backend must send the uploaded screenshot image or accessible image URL to a vision-capable model via OpenRouter. The prompt should instruct the model to act as a UI/UX reviewer and return structured output in JSON. The JSON should include:

* overall_summary
* issues array
* each issue should contain:

  * title
  * description
  * severity
  * recommendation
  * approximate_region
* any optional notes about accessibility or hierarchy

The AI output should be parsed and stored safely. The frontend must render this structured result cleanly in the AI tab.

Interaction details:
When a user creates feedback, the drag selection should create a rectangle with coordinates based on the screenshot image bounds. The comment popup should appear immediately after selection. The comment should be linked to that specific region. Clicking on a feedback item should scroll or focus the corresponding area on the screenshot. Hover states should be subtle but clear.

When multiple feedback items exist, the screenshot should still remain readable. Markers should be minimized. The sidebar should be the main place where comments are read and managed.

Non-goals for MVP:
Do not build:

* nested comment threads
* realtime collaboration
* notifications
* voting/upvoting
* complex project workspaces
* multiple roles beyond owner and viewer
* advanced analytics
* browser extensions
* video upload support
* version comparison
* comment filters
* heavy enterprise features

Deployment requirements:
Frontend must deploy on Vercel. Backend must deploy on Render. Supabase handles database and storage. The app must be production-ready enough for a small MVP with clean architecture and simple maintainable code.

Visual and product goals:
The product must feel like a real SaaS, not a generic AI wrapper. The main value is visual feedback on screenshots. AI is a supporting feature, not the core product. Human community feedback is the primary experience, while AI critique is a private enhancement for the screenshot owner.

Output expectations:
Generate the full project with sensible folder structure, reusable components, API logic, database schema design, and a polished interface that matches the product description. The implementation should be practical for an MVP and designed so that the project can be built quickly while still feeling thoughtful and complete.
