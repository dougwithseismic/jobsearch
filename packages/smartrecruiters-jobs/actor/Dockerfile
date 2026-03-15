FROM apify/actor-node:20

COPY --chown=myuser:myuser . ./

RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -f *.tgz

CMD ["node", "dist/main.js"]
