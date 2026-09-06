""" Module for parsing and evaluating Calculation expressions

A Calculation arrives as a comma-separated token string where data points are
`source:field` tokens, operators and parentheses are bare tokens. Values are
substituted per municipality and the resulting arithmetic expression is
evaluated with a restricted ast walker. Only arithmetic operators, unary
minus/plus and parentheses are permitted - never eval/exec.
"""

import ast
import operator as op
import re

from decimal import Decimal

_ALLOWED_BINOPS = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
}

_ALLOWED_UNARYOPS = {
    ast.UAdd: op.pos,
    ast.USub: op.neg,
}

_TOKEN_RE = re.compile(r'^([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)$')


class CalculationError(ValueError):
    """ Raised when a Calculation token string is malformed or unsafe """


def parse_calc_token_string(calc:str) -> list[tuple[str, str]]:
    """ Parse a Calculation token string into Calculation Items

    Args:
        calc (str): Comma-separated token string, e.g. "finances:debt,/,municipality:pop_2020"
    Returns:
        (list): List of (source, field) tuples; operators use source "operator"
    Raises:
        CalculationError: If any token is malformed
    """
    items: list[tuple[str, str]] = []
    for raw_token in calc.split(','):
        token = raw_token.strip()
        if token == '':
            raise CalculationError("Calculation contains an empty token")

        if token in ('+', '-', '*', '/', '(', ')'):
            items.append(('operator', token))
            continue

        match = _TOKEN_RE.match(token)
        if match is None:
            raise CalculationError(f"Invalid calculation token: '{token}'")

        items.append((match.group(1), match.group(2)))
    return items


def resolve_value(source:str, field:str, values:dict[str, dict[str, object]]) -> object:
    """ Resolve a data point's value for one municipality

    Args:
        source (str): Data source name ("finances" or "municipality")
        field (str): Field name within the source
        values (dict): Map of source name to that source's fields for one municipality
    Returns:
        (object): The resolved value
    Raises:
        KeyError: If the source or field is missing
        TypeError: If the value is not numeric
    """
    if source not in values:
        raise KeyError(f"Unknown calculation source: '{source}'")

    if field not in values[source]:
        raise KeyError(f"Unknown calculation field: '{source}:{field}'")

    value = values[source][field]
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        raise TypeError(f"Non-numeric value for '{source}:{field}'")

    return float(value)


def evaluate_calculation(expression:str) -> float:
    """ Evaluate an arithmetic expression with a restricted ast walker

    Args:
        expression (str): Arithmetic expression with numbers substituted in
    Returns:
        (float): The result
    Raises:
        CalculationError: If the expression contains anything but arithmetic
        ZeroDivisionError: On division by zero
    """
    try:
        tree = ast.parse(expression, mode='eval')
    except SyntaxError as ex:
        raise CalculationError(f"Invalid calculation expression: {ex}") from ex

    def _eval(node:ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BINOPS:
            return _ALLOWED_BINOPS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARYOPS:
            return _ALLOWED_UNARYOPS[type(node.op)](_eval(node.operand))
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        raise CalculationError(f"Disallowed expression element: {type(node).__name__}")

    return _eval(tree)


def build_expression(items:list[tuple[str, str]], values:dict[str, dict[str, object]]) -> str:
    """ Build an arithmetic expression string from Calculation Items and values

    Args:
        items (list): Calculation Items as (source, field) tuples
        values (dict): Map of source name to that source's fields for one municipality
    Returns:
        (str): Expression with values substituted
    Raises:
        KeyError, TypeError: If a data point cannot be resolved
    """
    parts: list[str] = []
    for source, field in items:
        if source == 'operator':
            parts.append(field)
        else:
            value = resolve_value(source, field, values)
            parts.append(repr(value))
    return ' '.join(parts)