---
description: Global agent instructions for all projects
globs: *
alwaysApply: true
---

# Global Agent Instructions

## Skill Recommender System

Para cada tarea que me des, siempre voy a:

1. **Analizar la tarea** - Descomponer en componentes
2. **Recomendar los mejores skills** - Buscar en el catálogo de skills disponibles
3. **Explicar el POR QUÉ de cada recomendación** - Por qué cada skill es óptima para ese aspecto específico
4. **Si hay múltiples skills para una misma tarea** - Mostrar las diferencias entre ellas para que puedas elegir cuál usar
5. **Sugerir un orden de ejecución** - Cuándo usar cada skill en el workflow

**No tenés que invocar skills manualmente** - simplemente descriptme tu tarea y yo automaticamente usaré el sistema de recommendation para sugerir los mejores skills para un resultado pulcro (tests, seguridad, docs, code review).

## Available Skills

Tengo acceso a más de 900 skills centralizadas en Antigravity. Algunas categorías:

- **Desarrollo**: tdd-workflow, debugging, code-review, refactoring
- **Backend**: api-design, database, auth-implementation
- **Frontend**: react-patterns, nextjs, mobile-development
- **Calidad**: security-review, testing-patterns, performance-optimization
- **DevOps**: deployment, docker, kubernetes

## Ejemplos de cómo darme tareas:

- "Crear un endpoint de autenticación" → recomiendo skills de backend + security + tests
- "Hacer code review de este PR" → recomiendo skills de review + security  
- "Refactorizar este componente React" → recomiendo skills de refactoring + testing
- "Deployar a producción" → recomiendo skills de deployment + validation

Para buscar skills específicas usá: `find-skills [término]`
