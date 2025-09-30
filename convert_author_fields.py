#!/usr/bin/env python3
import os
import yaml


def convert_yaml_author_fields(directory):
    """Convert all YAML files to use simple 'author' field instead of 'author_object'"""
    converted_count = 0

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".yaml") or file.endswith(".yml"):
                file_path = os.path.join(root, file)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Parse YAML
                    data = yaml.safe_load(content)

                    if data and isinstance(data, dict):
                        changed = False

                        # Convert author_object.name to simple author field
                        if "author_object" in data and isinstance(
                            data["author_object"], dict
                        ):
                            if "name" in data["author_object"]:
                                data["author"] = data["author_object"]["name"]
                                del data["author_object"]
                                changed = True
                                print(f"Converted {file_path}: author_object -> author")

                        # Remove author_id field
                        if "author_id" in data:
                            del data["author_id"]
                            changed = True
                            print(f"Removed author_id from {file_path}")

                        # Write back if changed
                        if changed:
                            with open(file_path, "w", encoding="utf-8") as f:
                                yaml.dump(
                                    data,
                                    f,
                                    default_flow_style=False,
                                    allow_unicode=True,
                                    sort_keys=False,
                                )
                            converted_count += 1

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    print(f"Conversion complete! {converted_count} files updated.")


if __name__ == "__main__":
    convert_yaml_author_fields("content/components")
