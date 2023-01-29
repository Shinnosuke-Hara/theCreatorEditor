import type { ElementNode, LexicalEditor, RangeSelection, TextNode } from 'lexical'

import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $isAtNodeEnd } from '@lexical/selection'
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import React, { useCallback, useEffect, useState } from 'react'
import DropDown, { DropDownItem } from './DropDown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

function setBlocksTypeExperimental(
  selection: import('lexical').RangeSelection | import('lexical').GridSelection,
  arg1: () => import('lexical').ParagraphNode,
) {
  throw new Error('Function not implemented.')
}

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
}

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active'
  else return ''
}

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName
  editor: LexicalEditor
  disabled?: boolean
}) {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))
          setBlocksTypeExperimental(selection, () => $createParagraphNode())
      })
    }
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          setBlocksTypeExperimental(selection, () => $createHeadingNode(headingSize))
        }
      })
    }
  }

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  return (
    <DropDown
      disabled={disabled}
      buttonClassName='toolbar-item block-controls'
      buttonIconClassName={'icon block-type ' + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel='Formatting options for text style'
    >
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'paragraph')} onClick={formatParagraph}>
        <span className='text'>Normal</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'h1')} onClick={() => formatHeading('h1')}>
        <span className='text'>Heading 1</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'h2')} onClick={() => formatHeading('h2')}>
        <span className='text'>Heading 2</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'h3')} onClick={() => formatHeading('h3')}>
        <span className='text'>Heading 3</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'bullet')} onClick={formatBulletList}>
        <span className='text'>Bullet List</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'number')} onClick={formatNumberedList}>
        <span className='text'>Numbered List</span>
      </DropDownItem>
      <DropDownItem className={'item ' + dropDownActiveClass(blockType === 'check')} onClick={formatCheckList}>
        <span className='text'>Check List</span>
      </DropDownItem>
    </DropDown>
  )
}

export function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode
  }
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph')
  const [isEditable, setIsEditable] = useState(() => editor.isEditable())

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode)
          const type = parentList != null ? parentList.getListType() : element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType()
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName)
          }
        }
      }
    }
  }, [activeEditor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar()
        setActiveEditor(newEditor)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable)
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
    )
  }, [activeEditor, editor, updateToolbar])

  return (
    <>
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
        </>
      )}
    </>
  )
}
