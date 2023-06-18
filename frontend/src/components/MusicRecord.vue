<template>
  <div class="record">
    <div class="content">
      <n-tag
        :color="{
          color: getColor(props.data.level_label.toUpperCase()),
          textColor: 'white',
          borderColor: '#555',
        }"
        class="level"
        :bordered="false"
        small
      >
        {{ props.data.level_label.toUpperCase() }}
      </n-tag>
      <div class="title">
        {{ props.data.title }}
      </div>
      <div class="achievements">
        <span> {{ props.data.achievements }}% </span>
        <span
          :class="`${getAchievementName(props.data.achievements).replaceAll(
            '+',
            'plus'
          )} achievement`"
        >
          <template
            v-if="getAchievementName(props.data.achievements) === 'SSS+'"
          >
            <span style="color: gold">S</span>
            <span style="color: skyblue">S</span>
            <span style="color: red">S</span>
            <span style="color: gold">+</span>
          </template>
          <template
            v-else-if="getAchievementName(props.data.achievements) === 'SSS'"
          >
            <span style="color: gold">S</span>
            <span style="color: skyblue">S</span>
            <span style="color: red">S</span>
          </template>
          <template v-else>
            {{ getAchievementName(props.data.achievements) }}
          </template>
        </span>
      </div>
      <div class="base">Base {{ props.data.ds }} -> {{ props.data.ra }}</div>
    </div>
    <div
      class="background"
      :style="`background-image:url(${getCoverPathById(props.data.song_id)})`"
    ></div>
  </div>
</template>

<script setup>
const props = defineProps(['data'])

function getCoverPathById(songId) {
  const baseURL = 'https://www.diving-fish.com/covers/'
  let i = parseInt(songId)
  if (i > 10000 && i <= 11000) i -= 10000
  return baseURL + (i + '').padStart(5, '0') + '.png'
}

function getAchievementName(achievements) {
  achievements = Number(achievements)
  if (achievements < 50) return 'D'
  if (achievements < 60) return 'C'
  if (achievements < 70) return 'B'
  if (achievements < 75) return 'BB'
  if (achievements < 80) return 'BBB'
  if (achievements < 90) return 'A'
  if (achievements < 94) return 'AA'
  if (achievements < 97) return 'AAA'
  if (achievements < 98) return 'S'
  if (achievements < 99) return 'S+'
  if (achievements < 99.5) return 'SS'
  if (achievements < 100) return 'SS+'
  if (achievements < 100.5) return 'SSS'
  return 'SSS+'
}

function getColor(level) {
  // ['Basic', 'Advanced', 'Expert', 'Re:MASTER', 'Master']
  if (level === 'BASIC') return 'green'
  if (level === 'ADVANCED') return 'orange'
  if (level === 'EXPERT') return 'red'
  if (level === 'RE:MASTER') return '#fab9e6'
  if (level === 'MASTER') return '#db4aff'
  return 'gray'
}
</script>

<style scoped>
.record {
  margin-top: 12px;
  height: 108px;
  /* background-color: rgba(0, 128, 0, 0.12); */
}
.background {
  z-index: 88;
  background-position: center;
  background-size: cover;
  height: 108px;
  filter: blur(1px) brightness(70%);
  display: block;
  margin-top: -116px;
  border-radius: 4px;
}

.content {
  padding: 8px 8px;
  /* font-size: 16px; */
  height: 108px;
  /* color: red; */
  z-index: 89;
  position: relative;
  font-size: 20px;
  font-weight: 400;
}

.content div {
  line-height: 26px;
}

.title {
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  overflow-x: hidden;
}

.level {
  height: 26px;
  text-shadow: 0 0 0;
}

.achievements {
  display: flex;
}

.achievement {
  margin-left: 4px;
  text-shadow: 0.1em 0.1em 0.1em #000;
  font-weight: 800;
}

.base {
  font-size: 16px;
  margin-top: -4px;
}

div {
  color: white;
  text-shadow: 0.1em 0.1em 0.1em #000;
}

.SS,
.SSplus,
.S,
.Splus {
  color: gold;
}

.AAA,
.AA,
.A {
  color: red;
}

.B,
.BB,
.BBB {
  color: blue;
}

.C,
.D {
  color: green;
}
</style>
