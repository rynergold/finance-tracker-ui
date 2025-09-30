import { ActionIcon, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useAddCategory } from '@/shared/lib/hooks/addCategory';
import { useDeleteCategory } from '@/shared/lib/hooks/deleteCategory';
import { useFetchCategories } from '@/shared/lib/hooks/fetchCategories';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function ManageCategoriesModal({ opened, onClose }: Props) {
  const { data: categories = [] } = useFetchCategories();
  const { mutateAsync: deleteCategory } = useDeleteCategory();
  const { mutateAsync: createCategory, isPending: isCreating } = useAddCategory();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const handleDelete = async (id: number) => {
    if (confirm('Delete this category? Transactions using it cannot be created.')) {
      await deleteCategory(id);
    }
  };
  
  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    
    await createCategory({ categoryName: newCategoryName.trim() });
    setNewCategoryName(''); // Clear input after success
  };
  
  return (
    <Modal opened={opened} onClose={onClose} title="Manage Categories">
      <Stack>
        {/* Add new category section */}
        <Group>
          <TextInput
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate();
            }}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleCreate}
            disabled={!newCategoryName.trim() || isCreating}
            loading={isCreating}
          >
            Add
          </Button>
        </Group>
        
        {/* Existing categories list */}
        <Text size="sm" fw={500} mt="md">Existing Categories</Text>
        {categories.length === 0 ? (
          <Text size="sm" c="dimmed">No categories yet. Add one above!</Text>
        ) : (
          categories.map(category => (
            <Group key={category.id} justify="space-between">
              <Text>{category.categoryName}</Text>
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => handleDelete(category.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))
        )}
      </Stack>
    </Modal>
  );
}