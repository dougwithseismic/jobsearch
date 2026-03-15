FROM apify/actor-node:20

COPY --chown=myuser:myuser . ./

RUN npm --quiet set progress=false \
    && npm install --no-optional \
    && npx tsc \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && rm -f *.tgz

CMD ["node", "dist/main.js"]
