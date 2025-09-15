""" Module to build prompts for cross section image generation """


def build_prompt(units:str, sections, style:str) -> str:
    section_descriptions = []
    for s in sections:
        desc = (
            f"{s['name']} section, {s['width']} {units} wide, "
            f"ground material: {s['material']}, "
            f"use: {s['use']}"
            + (f", details: {s['comments']}" if s.get("comments") else "")
        )
        section_descriptions.append(desc)

    sections_text = "; ".join(section_descriptions)
    prompt = (
        f"2D cross section of an urban street design, styled according to the provided '{style}' reference image. "
        f"Left to right: {sections_text}. "
        "Show clear section divisions with thick ground plane lines/textures reflecting ground material for each section. "
        "Include realistic objects and textures from the style reference—cars, people, bikes, trees, landscaping, etc. "
        "Underline each section with a label showing its width and use. "
        "Produce crisp, detailed professional illustration, composition focused on a horizontal street cross-section."
    )
    return prompt
