import { Loader, Stack, Text } from "@mantine/core";

interface TableLoadingOverlayProps {
  message?: string;
}

export function TableLoadingOverlay({ message = "Loading transactions..." }: TableLoadingOverlayProps) {
  return (
    <Stack
      align="center"
      justify="center"
      style={{ minHeight: '400px' }}
      gap="md"
    >
      <Loader size="lg" type="dots" /> {/* or type="bars", "oval", etc. */}
      {message && (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      )}
    </Stack>
  );
}