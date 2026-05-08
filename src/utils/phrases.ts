export const MOTIVATIONAL_PHRASES = [
  '¡Día perfecto! Eres imparable 🔥',
  '100% completado. Así se hace 💪',
  'Otra jornada dominada. Sigue así 🚀',
  '¡Lo lograste! Hoy fue un gran día ⭐',
  'Completado al 100%. ¡Eres increíble! 🌟',
  '¡Hábitos en acción! Qué orgulloso/a debes estar 😤',
  'Perfección diaria. Así se construye el éxito 🏆',
  '¡Todo listo! Tu disciplina es admirable 🎯',
  'Un día más conquistado. ¡Tú puedes con todo! 💥',
  '¡Felicidades! Cada tarea te acerca a tus metas 🎉',
  'Constancia y disciplina. Así se logran las metas 📈',
  '¡Crack total! Día completado al máximo 🦾',
  'Hoy dijiste "sí" a tus compromisos. ¡Bravo! 👏',
  'Modo bestia activado. Mañana igual o mejor 🐉',
  'Sin excusas, solo resultados. ¡Eso es! ✅',
  'El éxito es la suma de pequeños esfuerzos repetidos 🔑',
  '¡Wow! Completaste todo hoy. Eres una máquina 🤖',
  'Cada día que cumples te conviertes en mejor versión 🌱',
  'Disciplina > Motivación. Y hoy lo demostraste 💡',
  '¡Día ganado! El trabajo duro siempre da frutos 🍀',
  'Tu futuro yo te lo agradecerá 🙌',
  'Cuando el compromiso habla, los resultados escuchan ✨',
]

export function getRandomPhrase(): string {
  return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
}
