FROM apify/actor-node:22

# Copy and build the smartrecruiters-jobs library in a known location
WORKDIR /home/myuser/lib
COPY --chown=myuser package.json ./package.json
COPY --chown=myuser tsconfig.json ./tsconfig.json
COPY --chown=myuser src/ ./src/
RUN npm install --include=dev && npx tsc

# Set up the actor
WORKDIR /home/myuser/actor
COPY --chown=myuser actor/package.json ./package.json
COPY --chown=myuser actor/tsconfig.json ./tsconfig.json
COPY --chown=myuser actor/src/ ./src/

# Install actor deps, copy lib for types, build, prune, re-copy lib for runtime
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); delete p.dependencies['smartrecruiters-jobs']; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2))" && \
    npm install --include=dev && \
    mkdir -p node_modules/smartrecruiters-jobs && \
    cp /home/myuser/lib/package.json node_modules/smartrecruiters-jobs/ && \
    cp -r /home/myuser/lib/dist node_modules/smartrecruiters-jobs/ && \
    npx tsc && \
    npm prune --omit=dev && \
    mkdir -p node_modules/smartrecruiters-jobs && \
    cp /home/myuser/lib/package.json node_modules/smartrecruiters-jobs/ && \
    cp -r /home/myuser/lib/dist node_modules/smartrecruiters-jobs/

CMD ["node", "dist/main.js"]
