#!/bin/bash
# Fix sharp for old CPU — replace with stub

cd /var/www/HairCareStore/frontend

cat > node_modules/sharp/lib/sharp.js << 'STUBEOF'
module.exports = {};
STUBEOF

cat > node_modules/sharp/lib/index.js << 'STUBEOF'
const sharp = function(input) {
  const self = {
    resize() { return self; },
    toFormat() { return self; },
    toBuffer() { return Promise.resolve(Buffer.alloc(0)); },
    metadata() { return Promise.resolve({ width: 1, height: 1, format: 'png' }); },
    jpeg() { return self; },
    png() { return self; },
    webp() { return self; },
    avif() { return self; },
    toFile() { return Promise.resolve({ width: 1, height: 1 }); },
    clone() { return self; },
    rotate() { return self; },
    flip() { return self; },
    flop() { return self; },
    trim() { return self; },
    extend() { return self; },
    flatten() { return self; },
    composite() { return self; },
    negate() { return self; },
    normalise() { return self; },
    normalize() { return self; },
    gamma() { return self; },
    linear() { return self; },
    blur() { return self; },
    sharpen() { return self; },
    threshold() { return self; },
    ensureAlpha() { return self; },
    removeAlpha() { return self; },
    extractChannel() { return self; },
    stats() { return Promise.resolve({}); },
    pipe() { return self; },
  };
  return self;
};
sharp.cache = function() {};
sharp.concurrency = function() {};
sharp.counters = function() { return {}; };
sharp.simd = function() { return false; };
sharp.versions = { vips: '0.0.0' };
sharp.format = {};
module.exports = sharp;
STUBEOF

rm -rf node_modules/next/node_modules/sharp
cp -r node_modules/sharp node_modules/next/node_modules/sharp

echo "Sharp stub installed. Restarting PM2..."
pm2 restart hair-lab
sleep 2
pm2 logs hair-lab --lines 10
