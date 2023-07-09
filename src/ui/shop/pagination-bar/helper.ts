type Item = number | "...";
export function pagination(
  current: number,
  total: number,
  preferLength: number
): Item[] {
  preferLength = Math.max(7, preferLength);
  let mids: number[] = [current - 1, current, current + 1].filter(
    (p) => p >= 0 && p <= total - 1
  );
  let trails: Item[] = [];
  let leads: Item[] = [];

  // add leading items
  if (!mids.includes(0)) {
    if (mids[0] === 1) {
      leads = [0];
    } else if (mids[0] === 2) {
      leads = [0, 1];
    } else {
      leads = [0, "..."];
    }
  }

  // add trailing items
  if (!mids.includes(total - 1)) {
    if (mids[mids.length - 1] === total - 2) {
      trails = [total - 1];
    } else if (mids[mids.length - 1] === total - 3) {
      trails = [total - 2, total - 1];
    } else {
      trails = ["...", total - 1];
    }
  }
  // add item to reach 7
  let preferAddLead = Math.abs(current) > Math.abs(current - total);
  const first = 0;
  const last = total - 1;
  while (leads.length + mids.length + trails.length < preferLength) {
    // try remove item one by one from mids

    const canAddLead = leads.includes("..."); // include ... mean having some space to add items
    const canAddTrail = trails.includes("...");
    if (!canAddLead && !canAddTrail) {
      break;
    }

    if ((preferAddLead && canAddLead) || !canAddTrail) {
      // fill item
      const add = mids[0] - 1;
      mids.unshift(add);

      // check for stop filling condition
      if (add === first + 2) {
        leads[1] = first + 1;
        // [0,...] -> [0,1]
      }
    } else {
      // fill item
      const add = mids[mids.length - 1] + 1;
      mids.push(add);

      // check for stop filling condition
      if (add === last - 2) {
        trails[0] = last - 1;
        // [..., last] -> [last-1,last]
      }
    }
    preferAddLead = !preferAddLead;
  }

  return [...leads, ...mids, ...trails];
}

// 1 ... 5 [6] 7 ... 9

// 1 [2] 3 4| 5 .. 20

// 0 |1 2 [3] 4 5| 6 .. 20

// 0 1 |2 3 [4] 5 6| .. 20

// 0 ... |3 4 [5] 6 7| ... 20

// 0 ... 4 5 [6] 7 8
