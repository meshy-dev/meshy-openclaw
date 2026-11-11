# Changelog

## [0.9.6] - 2026-11-11

### Changed

- The skill moved here from meshy-3d-agent, so agents that install from that repository no longer
  pick up a third, combined copy of the generation and printing skills. The ClawHub listing and
  its install command are unchanged. The references are vendored from meshy-3d-agent 0.9.6:
  - A model from a description now starts with a recommended reference image, shown for
    approval before the model is built from it; text-to-3d stays available as the quicker
    alternative.
  - The skill text is shorter, without guidance that is not about Meshy.

Earlier versions are in the [meshy-3d-agent changelog](https://github.com/meshy-dev/meshy-3d-agent/blob/main/CHANGELOG.md).
