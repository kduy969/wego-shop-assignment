# Project summary

## Build stack
Vite + React + Typescript.

## Testing tools
Jest, Testing-library.

## Deployment tool
Gh-pages.

## Approach

### Pagination
1. Load an amount of items on initial.
2. Autoload new items on hit bottom.
3. After taking up to a certain amount of items, ask user to go to the next page.
4. User click on "Next page" button -> load next page items and replace the current items with the new items.
5. Back to step 2 until finishing load all items.

### Search and filter
* User can filter the products show on screen in 2 ways:
  * Filter by text search.
  * Filter by category.
* Update search filter will not affect category filter and vice-versa.
* Update any filter will reset pagination.

### Responsiveness
Work on both mobile and laptop, you can also try to resize your window and see the change in layout.

## Setup
1. Install packages: $yarn
2. Run in development: $yarn dev
3. Deploy: $yarn build && $yarn deploy
