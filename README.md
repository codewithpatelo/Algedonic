# Algedonic
Cybernetics applied for mapping working-class emotional states
![image](https://user-images.githubusercontent.com/16574952/173205437-58eea16f-089f-4586-b6b9-8d9262c4c072.png)

1. `npm i .`
2. `npm run build`
3. `node ./__sapper__/build`
4. Go to `http://localhost:3000`

Alternatively, you can start dev mode by using `npm run dev`.

**No need to configure envs.**

**Case outline:**

 While we're more connected than ever in history thanks to
                    technology, more often than not, we can see people
                    struggling with complex emotions and moods. They/We're coping with
                    such emotions alone, and they/we might think they/we're the only ones
                    experiencing such hardships. Now, as working-class people,
                    while we keep our minds busy over the 5/9 routine, sometimes
                    we lose perspective on how common and pandemic this issue really is. Not to mention how
                    shared those emotions are with your peers. Widespread depression and anxiety is, in fact, nowadays a
                    global public health issue (In fact, according to the WHO, it is estimated that 5.0% of adults suffer from depression). But, what if we, collectively, can help each other to make something out of this reality?
                    The fact that people starting to experience loneliness don't know about each other and their coping strategies
                    undermine opportunities for mutual-aid and collective
                    action. Algedonic uses cybernetic technology (an algedometer + feedforward adaption procedure of pain alleviation to handle system disturbances) to collect anonymous data about affective states
                    from working people. Algedonic not only shows you that you're not the only one feeling that way but encourages you and connect with people from the community to actually brainstorm structural strategies of mutual aid helping community members to map and organize collective action focused on tackling such issues collaborative peer-reported by the community. Algedonic, then, turns those previously unknown disturbances into opportunities to enhance the adaptive resilience of the community and its comprising peer members.
                  


**Architecture:**

SapperJs (todo: Upgrade to SvelteKit + Typescript), Svelte (todo: Upgrade Typescript syntax), Rollup Bundler, 
MaterializeCss Admin Dashboard + Neumorphism UI (todo: Shift entirely to Neumorphism UI so that app uses lower resources, minify files, compress images and files, code cache and prefetch what could be preloaded), Nodefetch (todo: Opt for Axios), Polka (todo: Upgrade to inbuilt Sveltekit handling). Remove unnecesary files. Comment code functionality.

![image](https://user-images.githubusercontent.com/16574952/173208359-533036c4-a0b8-4534-a0b9-cab551bdb679.png)


_Other TODOs:_ Build Eslint-Prettier pipeline, Add Cypress UT, Add Coverage Tests, Add vulnerability checks. Add CI pipeline. Refine and purge NavBar Autocomplete legacy models. Finish Sidebarpages. Add reactivity to aggregation for glowing circle. Add upload mood function. Connect with own DB (NestJS). Add expire headers and improve cache. Remove unnecesary cookies. Dockerify repository.

![image](https://user-images.githubusercontent.com/16574952/173208447-b130c0dd-18a4-4cb9-933b-2d2d20888895.png)

**Sources:**

- https://www.who.int/news-room/fact-sheets/detail/depression

