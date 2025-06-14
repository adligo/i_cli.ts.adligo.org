/**
 * 
 * These interfaces provide a tree like command structure for command line programs.
 * As parameters or arguments are processed they are grouped by the parent command initially
 * starting with a hidden root command (the program itself).  
 *   Flags and KeyValue pairs are added under the context of the current Command until a Command
 * string is encoutered. Then the process repeats so that the current Flags and KeyValue pairs 
 * are associated with the parent Command.  This also give the user a tree like structure for 
 * things like --help which can summarize the current options some levels down, to keep the 
 * help content more focused on whats currently available.
 * 
  * Copyright 2025 Adligo Inc / Scott Morgan
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
import { I_Log, I_LogCtx, I_Console, I_LogConfig, LogLevel } from
  '@ts.adligo.org/i_log2/dist/i_log2.mjs';
import { PathLike, PathOrFileDescriptor, WriteFileOptions } from 'fs';
/**
* The CliOption enum represents the types of command line arguments or parameters that 
* can be passed to a i_cli command line program.  
* 
* A Command is a cli argument or parameter with out a dash prefix 
* or double dash prefix, and has no value associated with it. For example;
* enc  => encrypt a file, with out specifying which file
* dec  => decrypt a file, with out specifying which file
* enca   => short for 'encrypt all' with out specifying what all means
* deca   => short for 'decrypt all' with out specifying what all means
* 
* A Flag is a cli argument or parameter with either a single dash prefix prefixing a single letter
* or double dash prefixing a longer string, and has no value associated with it. For example;
* -d => Debug the program
* --debug => A more verbose way to command the program to debug itself.
* -xvz   => four flags to tar to tell tar to eXtract, Verbosly, z (decompress a compressed .gz file)
*   Note: I_Cli Flags can be concatinated with their single letters, so if you have multiple flags you can 
*     use the -xyz syntax.  
* 
* A KeyValue is a cli argument or parameter with either a single dash prefixing a single letter
* or double dash prefix prefixing a longer string, and has no value associated with it. For example;
* -l info => Instructs the cli program to log (-l) and provides the info value.
* --log info  => A more verbose way to innstruct the cli program to log at the info level.
* 
*/
export enum CliOptionType {
  Command,
  Flag,
  KeyValue
}
/**
 * This is the main Command Line Interface TypeScript Interface for command line programs.
 * Basically part of a competetor to the commander project https://www.npmjs.com/package/commander.
 */
export interface I_CliCtx extends I_CliOptions, I_Console, I_LogCtx, I_PathFsCtx, I_Process {



  /**
   * return the current command 
   */
  getCommand(): I_CliArg;
  /**
   * return the current working directory from the start of the process
   */
  getCwd(): I_Path;

  /**
   * returns the value associated with this key in the cli arguments
   */
  getValue(key: I_CliOption): string;
  /**
   * If this context has the flag or not
   */
  hasFlag(flag: I_CliOption): boolean;
  /**
   * If this context has the key which specifies a value, or not
   */
  hasKey(key: I_CliOption): boolean;



}

export interface I_CliCtxParams {
  getConsole(): I_Console;
  getLogCtx(): I_LogCtx;
  getOptions(): I_CliOptions;
  getPathFsCtx(): I_PathFsCtx;
  getProcess(): I_Process;
}

/**
 * I_CliArg represents something actually on the cli at runtime
 * a parameter or argument
 */
export interface I_CliArg {
  /**
   * The option associated with this flag
   */
  getFor(): I_CliOption;
}
/**
 * I_CliArg represents something actually on the cli at runtime
 * a parameter or argument that was a KeyValue type
 */
export interface I_CliArgKeyValue extends I_CliArg {
  /**
   * The value on the cli associated with the key from getFor()
   */
  getValue(): string;
}

/**
 * The I_CliOption interface represents something that the user can do with 
 * this command line program, by typing in the command line.  These options will also 
 * show up in the help.
 */
export interface I_CliOption {
  /**
   * This is the description of what the command should do,
   * basically for the --help output.
   */
  getDescription(): string;
  /**
   * This is a optional single letter abbreviation of the name
   * i.e. 'i' in npm i
   */
  getAbbreviatedName(): string | undefined;
  /**
   * Get the name for this command
   * i.e. install in npm install
   */
  getName(): string;
  /**
   * Return the type of this CliOption,
   * if this is a CliOptionType.Command then this can be 
   * cast to a I_CliCommandOptions
   */
  getType(): CliOptionType;
}

/**
 * I_CliOptions provides all of the I_CliOption's in a context (i.e.
 * for the whole program or under a specific command branch)
 */
export interface I_CliOptions {
  /**
   * get all the option long names
   */
  getOptions(): Set<string>;

  /**
   * get the option with long name
   */
  getOption(name: string): I_CliOption | undefined;

  /**
   * check if the option with the long name exists in this collection of options
   */
  hasOption(name: string): boolean;
}

/**
 * I_CliCommandOption represents the options under a specific command. 
 */
export interface I_CliCommandOption extends I_CliOption, I_CliOptions {
}



/**
 * This wraps the lower level fs node.js type for mocking and 
 * standardization of usage.  If you find yourself using fs 
 * directly from the adligo.org projects
 * you will want to create a pull request to update this interface and use it.
 */
export interface I_FsCtx {
  /**
   * Updates a file
   */
  appendFileSync(
    path: PathOrFileDescriptor,
    data: string | Uint8Array,
    options?: WriteFileOptions,
  ): void;

  /**
   * Copies a file
   */
  copyFileSync(src: PathLike, dest: PathLike): void;

  /**
   * @param path the OS dependent absolute path
   * @returns the string that represents the path that a Symlink is pointing at.
   */
  getSymlinkTarget(path: string): string;

  /**
   * @param path the OS dependent relative path
   * @param parentPath the absolute OS dependent path of the parent directory.
   * @returns the string that represents the relative path that a Symlink is pointing at.
   */
  getSymlinkTargetRelative(relativePath: string, parentPath: string, pathSeperator: string): string;

  isDir(path: string): boolean;
  isFile(path: string): boolean;
  /**
   * Identifies if this path is a Symlink or not
   * @param path the OS dependent absolute path
   * @returns True if the symlink exists, false otherwise.
   */
  isSymlink(path: string): boolean;

  readdirSync(
    path: PathLike,
    options?: { encoding: BufferEncoding | null, withFileTypes?: false | undefined, recursive?: boolean | undefined } | BufferEncoding | null,
  ): string[];

  /**
   * Reads a file
   */
  readFileSync(path: PathOrFileDescriptor, options?: {
    encoding?: BufferEncoding | undefined;
    flag?: string | undefined;
  } | null): string | undefined;
}

/**
 * Implementations of I_PathFsCtx bridge the I_Path interface
 * to the I_FsCtx interface.  
 */
export interface I_PathFsCtx {
  /**
   * This determines if a path (folder or file) exists.
   * @param path
   */
  existsAbs(path: I_Path): boolean;

  /**
   * This determines if a path (folder or file) exists.
   * @param relativePathParts
   * @param inDir
   */
  exists(fileOrDir: string, inDir: I_Path): boolean;

  /**
   * @param dir the absolute path of the Symlink
   * @returns The string of the Symlink target, or a empty string '' if this can not be determined.
   */
  getSymlinkTarget(dir: I_Path): I_Path;

  /**
   * @param dir the absolute path of the Symlink
   * @returns True if the absolute path is a Symlink, false otherwise. 
   */
  isSymlink(dir: I_Path): boolean;

  /**
   * @param path the OS dependent relative path
   * @param parentPath the absolute OS dependent path of the parent directory.
   * @returns the string that represents the relative path that a Symlink is pointing at.
   */
  getSymlinkTargetRelative(relativePath: I_Path, parentPath: I_Path): I_Path;

  mkdir(dir: string, inDir: I_Path): void;

  mkdirTree(dirs: I_Path, inDir: I_Path): I_Path;

  read(path: I_Path, charset?: string): any;

  readJson(path: I_Path): any;

  rd(dir: string, inDir: I_Path): void;

  rm(dir: string, inDir: I_Path): void;

  /**
   * create a new symbolic link
   */
  slink(slinkName: string, toDir: I_Path, inDir: I_Path): void;
}
/**
 * I_Path represents a directory and or file path.
 * Note: In order to identify if instances of this interface represent a file or 
 * a directory use the I_FsCtx interface.
 */
export interface I_Path {
  hasParent(): boolean;

  isRelative(): boolean;

  isRoot(): boolean;

  isWindows(): boolean;

  getParts(): string[];

  getParent(): I_Path;

  toString(): string;

  toUnix(): string;

  toWindows(): string;

  child(path: string): I_Path;
}

/**
 * I_Proc provides the ability to stub out process.env and process.env.SHELL
 * for testing
 */
export interface I_Process {
  /**
   * wrapps process.argv
   */
  argv(): string[];

  /**
   * the Current Working Directory
   * wrapps process.cws
   */
  cwd(): string;
  /**
   * wrapps process.env
   */
  env(): any;

  /**
   * wrapps process.env[name]
   * @param name
   */
  envVar(name: string): string;

  /** 
   * This exits the current program, wrapps process.exit
   */
  exit(code: number): void;

  getPathSeperator(): string;
  /**
   * return true if it's windows otherwise false
   */
  isWindows(): boolean;
  /**
 * wrapps process.env.SHELL
 */
  shell(): string;
}