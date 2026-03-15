export type RuleData = Record<string, any>;

export interface RuleEvaluationResult {
  isMatch: boolean;
  ruleId?: string;
  nextStepId?: string | null;
}

export class RuleEngine {
  /**
   * Evaluates a condition string against the provided data.
   * Supports: ==, !=, <, >, <=, >=, &&, ||, contains(), startsWith(), endsWith()
   * Example: "amount > 100 && country == 'US'"
   */
  public evaluate(condition: string, data: RuleData): boolean {
    if (condition.toUpperCase() === 'DEFAULT') {
      return true;
    }

    try {
      // 1. Pre-process the condition to handle custom functions like contains, startsWith, endsWith
      let processedCondition = condition;

      // Replace functions: contains(field, "value") -> data.field.includes("value")
      processedCondition = this.replaceFunctions(processedCondition, data);

      // Replace fields: field -> data.field
      // We need to be careful not to replace keywords like true/false/null or strings
      // For simplicity in this "scratch" implementation, we'll use a regex to wrap field names
      // BUT a better way is a real parser. For now, let's use a robust regex replacement.
      
      const keys = Object.keys(data);
      keys.sort((a, b) => b.length - a.length); // Longest first to avoid partial matches

      for (const key of keys) {
        // Only replace if it's a standalone word (not inside quotes or part of another word)
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedCondition = processedCondition.replace(regex, `data['${key}']`);
      }

      // Convert logical operators if they aren't JS friendly (though they are)
      // && and || are already JS friendly.

      // Evaluate the expression
      // Note: In a real production system, you'd use a safe evaluator to avoid RCE.
      // For this demonstration, we'll use a Function constructor but acknowledge the risk.
      const evaluator = new Function('data', `return ${processedCondition};`);
      return !!evaluator(data);
    } catch (error) {
      console.error('Error evaluating rule:', condition, error);
      return false;
    }
  }

  private replaceFunctions(condition: string, data: any): string {
    let result = condition;

    // contains(field, "value")
    result = result.replace(/contains\((\w+),\s*["'](.+?)["']\)/g, (_, field, value) => {
      return `(data['${field}'] && data['${field}'].toString().includes('${value}'))`;
    });

    // startsWith(field, "prefix")
    result = result.replace(/startsWith\((\w+),\s*["'](.+?)["']\)/g, (_, field, value) => {
      return `(data['${field}'] && data['${field}'].toString().startsWith('${value}'))`;
    });

    // endsWith(field, "suffix")
    result = result.replace(/endsWith\((\w+),\s*["'](.+?)["']\)/g, (_, field, value) => {
      return `(data['${field}'] && data['${field}'].toString().endsWith('${value}'))`;
    });

    return result;
  }
}
