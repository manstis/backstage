/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { Badge, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

export interface ItemDescription {
  id: string;
  name: string;
  description?: string;
}

interface IOwnProps {
  itemDescription: ItemDescription;
}

const ItemDescriptor = (props: IOwnProps) => {
  const { itemDescription } = props;

  const idStringModifier = (strId: string) => {
    return <Typography>{strId.substring(0, 5)}</Typography>;
  };
  return (
    <Tooltip title={itemDescription.id}>
      <span>
        {itemDescription.name}{' '}
        {itemDescription.description ? (
          <Badge>{itemDescription.description}</Badge>
        ) : (
          idStringModifier(itemDescription.id)
        )}
      </span>
    </Tooltip>
  );
};

export default ItemDescriptor;
